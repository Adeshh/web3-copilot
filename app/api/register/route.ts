import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const {name, email, password} = await req.json();

        if(!email || !password) {
            return Response.json({ error: "Email and password are required"}, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return Response.json({ error: "User with this email already exsist."},
                {status: 400}
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        //Create the user in database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });

        return Response.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
        
       
    } catch (err) {
        console.error("[POST /api/register]", err);
        return Response.json({
            error: "Failed to create the user",
        }, { status: 500 });
    }
}