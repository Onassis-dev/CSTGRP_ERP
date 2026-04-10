import postgres from 'postgres';
import { updateMaterialAmount } from 'src/utils/functions';

export const updateContractorAmounts = async (
  id: number,
  sql2: postgres.Sql,
) => {
  const db = sql2;

  await db`UPDATE jobs SET 
  contractor = sub.total,
  "completedContractor" = ("contractorAmount" = sub.total)
  FROM (
    SELECT COALESCE(SUM(accepted), 0) AS total
    FROM contractormovements
    WHERE "orderId" = ${id} AND approved = true
  ) sub
  WHERE id = ${id};`;

  const [updatedMovement] = await db`update materialmovements set 
    "amount" = (select (calidad + contractor) from jobs where id = ${id}),
    "realAmount" = (select (calidad + contractor) from jobs where id = ${id})
    where id = (select "movementId" from jobs where id = ${id}) returning "materialId"`;

  if (updatedMovement)
    await updateMaterialAmount(updatedMovement.materialId, db);
};
