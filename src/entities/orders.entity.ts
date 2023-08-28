import { Column, Entity,  ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductsEntity } from "./products.entity";
import { UserEntity } from "./users.entity";
@Entity({
  name: "orders",
})
export class OrdersEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type:'int'
  })
  count!:number

  @ManyToOne(()=>ProductsEntity, (products) => products.orders)
  product!:ProductsEntity

  @ManyToOne(()=> UserEntity, (user)=> user.orders)
  user!: UserEntity
}
