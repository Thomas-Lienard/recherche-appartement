import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/google";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json(
      { error: "Non connecte. Veuillez vous connecter avec Google." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { to, subject, message } = body;

  if (!to || !subject || !message) {
    return Response.json(
      { error: "Champs requis : to, subject, message" },
      { status: 400 }
    );
  }

  try {
    await sendEmail(session.accessToken, to, subject, message);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return Response.json(
      { error: "Erreur lors de l'envoi du mail. Verifiez vos permissions Google." },
      { status: 500 }
    );
  }
}
