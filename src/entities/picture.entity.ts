import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductsEntity } from "./products.entity";

@Entity({
  name: "pictures",
})
export class PicturesEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type:'varchar',
    nullable: false,
  })
  pic!:string

  @ManyToOne(()=> ProductsEntity, (product)=> product.pictures, { onDelete : 'CASCADE', cascade:true})
  product!: ProductsEntity

}
