import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { ProductsEntity } from "./products.entity"


@Entity({
  name: "categories",
})
export class CategoriesEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({
    type: "varchar",
    length: "55",
    nullable: false,
    unique: true,
  })
  title!: string

  @OneToMany(() => ProductsEntity, (product) => product.category)
  products: ProductsEntity[]
  
}
