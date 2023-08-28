import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { OrdersEntity } from "./orders.entity"
import { UserEntity } from "./users.entity"
import { PicturesEntity } from "./picture.entity"
import { CategoriesEntity } from "./categories.entity"

@Entity({
  name: "products",
})
export class ProductsEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({
    type: "varchar",
    length: 105,
    nullable: false,
  })
  title!: string

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  description!: string

  @Column({
    type: "bigint",
    nullable: false,
  })
  price!: number

  @Column({
    type: "bigint",
    nullable: true,
  })
  discountprice?: number
  
  @Column({
    type: "int",
    nullable: true,
  })
  discountPersent?: number

  @Column({
    type: "varchar",
    length: 55,
    nullable: false,
  })
  brand!: string

  @Column({
    type: "varchar",
    length: 55,
    nullable: true,
  })
  color: string | null

  @Column({
    type: "varchar",
    length: 55,
    nullable: false,
  })
  maded_country!: string

  @Column({
    type: "bigint",
    nullable: true,
  })
  orders_count: number

  @Column({
    type: "varchar",
    nullable: true,
  })
  image:string

  @ManyToOne(() => CategoriesEntity, (category) => category.products)
  category!: CategoriesEntity 

  @OneToMany(() => OrdersEntity, (orders) => orders.product, { onDelete: "CASCADE" })
  orders: OrdersEntity[]

  @ManyToOne(() => UserEntity, (user) => user.products, { onDelete: "CASCADE" })
  user_id!: UserEntity

  @OneToMany(() => PicturesEntity, (pic) => pic.product, { onDelete: "CASCADE" })
  pictures: PicturesEntity[]
}
