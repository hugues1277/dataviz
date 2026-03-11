import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/api/utils/adminAuth";
import UserRepository, { UserRole } from "@/src/api/repositories/userRepository";
import logger from "@/src/shared/utils/logger";

/**
 * PATCH /api/admin/users/[id] - Met à jour un utilisateur (name, email, role)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request.headers);
    const { id } = await params;

    const body = await request.json();
    const { role, name, email } = body;

    const userRepository = new UserRepository();
    const user = await userRepository.get(id);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const currentRole = (user as { role?: string }).role;

    if (role !== undefined) {
      if (!["read", "edit", "admin"].includes(role)) {
        return NextResponse.json(
          { error: "Rôle invalide (read, edit ou admin)" },
          { status: 400 }
        );
      }
      if (currentRole === "admin" && role !== "admin") {
        const adminCount = await userRepository.getAdminCount();
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Il doit rester au moins un administrateur" },
            { status: 400 }
          );
        }
      }
      await userRepository.updateRole(id, role as UserRole);
    }

    if (name !== undefined || email !== undefined) {
      await userRepository.updateById(id, {
        name: name ?? user.name,
        email: email ?? user.email,
      });
    }

    const updated = await userRepository.get(id);
    return NextResponse.json(updated);
  } catch (error) {
    logger.error("PATCH /api/admin/users/[id]", error);
    const msg = (error as Error).message;
    if (msg.includes("forbidden") || msg.includes("autorisé")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id] - Supprime un utilisateur (admin uniquement)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(_request.headers);
    const { id } = await params;

    const userRepository = new UserRepository();
    const user = await userRepository.get(id);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Supprimer un admin : il doit rester au moins un admin
    if ((user as { role?: string }).role === "admin") {
      const adminCount = await userRepository.getAdminCount();
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Il doit rester au moins un administrateur" },
          { status: 400 }
        );
      }
    }

    await userRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE /api/admin/users/[id]", error);
    const msg = (error as Error).message;
    if (msg.includes("forbidden") || msg.includes("autorisé")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
