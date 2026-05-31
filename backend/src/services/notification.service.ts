import { prisma } from "@/lib/prisma";
import { pagination, meta } from "@/lib/response";
import type { TypeNotification } from "@prisma/client";

export class NotificationService {
  static create(d:{ userId:string; type:TypeNotification; titre:string; message:string; lienAction?:string; metaData?:Record<string,unknown> }) {
    return prisma.notification.create({ data: d });
  }
  static async notifyAdmins(d: Omit<Parameters<typeof NotificationService.create>[0],"userId">) {
    const admins = await prisma.user.findMany({ where:{ role:{in:["ADMIN","MANAGER"]}, isActive:true }, select:{id:true} });
    await Promise.all(admins.map(a => NotificationService.create({ ...d, userId:a.id })));
  }
  static async findAll(userId:string, sp:URLSearchParams) {
    const { page, limit, skip } = pagination(sp);
    const isRead = sp.get("isRead");
    const where = { userId, ...(isRead!==null && { isRead: isRead==="true" }) };
    const [data,total] = await Promise.all([
      prisma.notification.findMany({ where, orderBy:{createdAt:"desc"}, skip, take:limit }),
      prisma.notification.count({ where }),
    ]);
    return { data, meta: meta(total,page,limit) };
  }
  static markRead(id:string, userId:string) {
    return prisma.notification.updateMany({ where:{id,userId}, data:{isRead:true,readAt:new Date()} });
  }
  static markAllRead(userId:string) {
    return prisma.notification.updateMany({ where:{userId,isRead:false}, data:{isRead:true,readAt:new Date()} });
  }
  static countUnread(userId:string) {
    return prisma.notification.count({ where:{userId,isRead:false} });
  }
  static delete(id:string, userId:string) {
    return prisma.notification.deleteMany({ where:{id,userId} });
  }
}
