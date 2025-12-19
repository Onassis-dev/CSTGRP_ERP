import { HttpException } from '@nestjs/common';

export async function calculateProgress(id, dbInstance: any) {
  const [operation] = await dbInstance`update operations set progress = 
    (select COALESCE(SUM(progressmovements.added), 0) from progressmovements where progressmovements."operationId" = operations.id)
    where id = ${id} returning progress`;

  const [order] =
    await dbInstance`select (select amount from jobs where id = operations."orderId") as amount from operations where id = ${id}`;

  console.log(operation, order);
  if (operation.progress > order.amount) {
    throw new HttpException('El progreso no puede ser mayor al total', 400);
  }
}
