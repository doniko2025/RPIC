//backend/src/services/notification.service.ts
import { prisma } from "@/lib/prisma";
import { pagination, meta } from "@/lib/response";
import type { TypeNotification, Prisma } from "@prisma/client";

// Type interne du paramètre — garde Record<string,unknown> pour les appelants
type CreateNotifInput = {
  userId: string;
  type: TypeNotification;
  titre: string;
  message: string;
  lienAction?: string;
  metaData?: Record<string, unknown>;
};

export class NotificationService {
  // FIX : metaData est un champ Json nullable dans Prisma.
  // Record<string,unknown> n'est pas assignable à NullableJsonNullValueInput | InputJsonValue
  // car unknown est trop large. Cast vers NotificationUncheckedCreateInput pour lever l'erreur.
  static create(d: CreateNotifInput) {
    return prisma.notification.create({ data: d as Prisma.NotificationUncheckedCreateInput });
  }

  static async notifyAdmins(d: Omit<CreateNotifInput, "userId">) {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MANAGER"] }, isActive: true },
      select: { id: true },
    });
    await Promise.all(admins.map(a => NotificationService.create({ ...d, userId: a.id })));
  }

  static async findAll(userId: string, sp: URLSearchParams) {
    const { page, limit, skip } = pagination(sp);
    const isRead = sp.get("isRead");
    const where = { userId, ...(isRead !== null && { isRead: isRead === "true" }) };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.notification.count({ where }),
    ]);
    return { data, meta: meta(total, page, limit) };
  }

  static markRead(id: string, userId: string) {
    return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true, readAt: new Date() } });
  }

  static markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
  }

  static countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  static delete(id: string, userId: string) {
    return prisma.notification.deleteMany({ where: { id, userId } });
  }
}