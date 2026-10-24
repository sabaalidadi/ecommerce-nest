
import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity.js'

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  name: string; // مثل: address.read.self , product.delete

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
