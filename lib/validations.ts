import * as z from "zod"

export const loginSchema = z.object({
    email: z.string().email({ message: "Correo inválido" }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    apellido: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("Correo inválido"),
    celular: z.string().min(8, "Mínimo 8 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const resetPasswordSchema = z.object({
    email: z.string().email("Correo inválido"),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const updatePasswordSchema = z.object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

export const categorySchema = z.object({
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    emoji: z.string().min(1, "Debe seleccionar un emoji"),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const transactionSchema = z.object({
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    valor: z.coerce.number().positive("El valor debe ser positivo"),
    tipo: z.enum(["ingreso", "gasto"]),
    categoria_id: z.string().uuid("Seleccione una categoría"),
})

export type TransactionInput = z.infer<typeof transactionSchema>

export const profileSchema = z.object({
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    apellido: z.string().min(2, "Mínimo 2 caracteres"),
    celular: z.string().min(8, "Mínimo 8 caracteres"),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const userAdminSchema = registerSchema.extend({
    rol: z.enum(["user", "admin"]),
    activo: z.boolean(),
})

export type UserAdminInput = z.infer<typeof userAdminSchema>

export const userAdminUpdateSchema = z.object({
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    apellido: z.string().min(2, "Mínimo 2 caracteres"),
    celular: z.string().min(8, "Mínimo 8 caracteres"),
    rol: z.enum(["user", "admin"]),
    activo: z.boolean(),
})

export type UserAdminUpdateInput = z.infer<typeof userAdminUpdateSchema>
