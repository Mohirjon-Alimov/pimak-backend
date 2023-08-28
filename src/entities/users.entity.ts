import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrdersEntity } from "./orders.entity";
import { ProductsEntity } from "./products.entity";

@Entity({
  name: "users",
})
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: "44",
    nullable: false,
    unique: true,
  })
  username!: string;

  @Column({
    type: "varchar",
    length: "20",
    nullable: false,
  })
  password!: string;

  @Column({
    type: "int",
    nullable: true,
  })
  number: number;

  @Column({
    type: "varchar",
    nullable: false,
    default: "user",
  })
  type!: string

  @OneToMany(() => OrdersEntity, (orders) => orders.user, {
    onDelete: "CASCADE",
  })
  orders: OrdersEntity[];

  @OneToMany(() => ProductsEntity, (product) => product.user_id, {
    onDelete: "CASCADE",
  })
  products: ProductsEntity[];
}
