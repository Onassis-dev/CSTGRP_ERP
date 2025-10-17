import { Injectable } from '@nestjs/common';
import sql from 'src/utils/db';

@Injectable()
export class StatsService {
  async getOutOfStock() {
    const movements = await sql`WITH MaterialSum AS (
    SELECT 
        materials.id,
        SUM(materialmovements.amount) as total_amount
    FROM materialmovements
    JOIN materials ON materials.id = materialmovements."materialId"
    WHERE materialmovements.active = false
    GROUP BY materials.id
    )   

    SELECT 
        DISTINCT(materials.code),
        materials.description,
        materials.measurement, 
        materials.amount,
        materials."leftoverAmount",
        (
          SELECT string_agg("jobpo", ', ') 
          FROM materialmovements 
          JOIN materialie ON materialie.id = materialmovements."movementId" 
          WHERE "materialId" = materials.id 
          AND materialmovements.active = false
        ) as jobpo,
        ABS(ms.total_amount) as required,
        ABS(materials.amount + ms.total_amount) as missing
    FROM materials
    JOIN MaterialSum ms ON ms.id = materials.id
    WHERE materials.amount  + ms.total_amount < 0`;

    const secondMovements = await sql`SELECT 
    code, materialie.jobpo, measurement, description,
    (materials.amount + materials."leftoverAmount") AS missing
    FROM materialmovements JOIN materials ON materials.id = materialmovements."materialId"
    JOIN materialie ON materialie.id = materialmovements."movementId"
    WHERE 
        (materials.amount + materials."leftoverAmount") < 0
        AND materialmovements.id = (
            SELECT materialmovements_inner.id
            FROM materialmovements materialmovements_inner
            WHERE 
                materialmovements_inner."materialId" = materialmovements."materialId"
                AND materialmovements_inner.active = true
                AND materialmovements_inner."amount" < 0
            ORDER BY 
                materialmovements_inner."activeDate" DESC, 
                materialmovements_inner.id DESC
            LIMIT 1
        )`;

    return [...movements, {}, ...secondMovements];
  }

  async getMaterialWarnings() {
    const materials =
      await sql`select code, amount, description, "minAmount" , measurement from materials where amount <= "minAmount" and "minAmount" > 0 order by code desc`;
    return materials;
  }
}
