# PocketBase Schema & Audit Migrations

[แผนภาพเส้นทาง migration และไฟล์ที่ถูกเรียก](CLICK_FLOW.md)

ชุด Migration กลางสำหรับ PocketBase ของภาควิชา CS KMITL เพื่อจัดโครงสร้างฐานข้อมูล (Database Normalization), ระบบ Audit Log รวมศูนย์, และการเชื่อมโยง Relation ระหว่างแอปพลิเคชัน

---

## รายการ Migration ทั้งหมด (`pb_migrations/`)

| ไฟล์ Migration | คอลเลกชันที่เกี่ยวข้อง | คำอธิบาย |
| :--- | :--- | :--- |
| `1800000000_add_actor_fields.js` | หลายคอลเลกชัน | เพิ่มฟิลด์ actor พื้นฐาน |
| `1800000001_add_instance_approval_actor_fields.js` | `instances` | เพิ่มฟิลด์ actor สำหรับการอนุมัติ VM |
| `1800000002_add_portal_actor_fields.js` | `bookings`, `loan_requests`, etc. | เพิ่ม actor fields ในพอร์ทัลบริการ |
| `1800000003_create_admin_actions.js` | `admin_actions` | **สร้างระบบ Audit Log รวมศูนย์** สำหรับทุกบริการ (`booking`, `announcement`, `loan`, `printer`) |
| `1800000004_create_instance_admin_actions.js` | `instance_admin_actions` | **สร้าง Audit Log เฉพาะของ VM/init.d** บันทึกการ Approve, Reject, Delete |
| `1800000005_separate_deletion_and_clean_instances.js` | `instance_deletion_history`, `instances` | **แยกประวัติเครื่องที่ถูกลบ** ออกจาก `instances` และลบ 7 ฟิลด์ขยะทิ้ง |
| `1800000006_separate_infra_collection.js` | `instance_infra`, `instances` | **แยกข้อมูล Proxmox/Hypervisor** (`vmid`, `node`, `ip`, `provision_*`) ออกมาเป็นตาราง 1-to-1 ลดขนาด `instances` จาก 36 เหลือ 20 ฟิลด์ |
| `1800000007_drop_audit_logs.js` | `audit_logs` | ลบตาราง `audit_logs` เก่าที่ไม่ได้ใช้งานออกอย่างปลอดภัย |
| `1800000008_create_loan_items.js` | `loan_items`, `loan_requests` | **แตกตารางยืมของรายชิ้น** พร้อมแปลงข้อมูลเก่า 20 รายการเข้าสู่ระบบ Normalized |
| `1800000009_create_push_queue.js` | `push_queue` | **สร้างท่อแจ้งเตือนรวมศูนย์** สำหรับส่ง Push Notification ทุกระบบ |
| `1800000010_link_announcements_to_services.js` | `announcements`, `services` | **ผูก Relation `target_services`** กับตาราง `services` โดยตรงแทนการ Hardcode |

---

## ขั้นตอนการติดตั้งและรัน Migration
1. ส่งไฟล์ทั้งหมดใน `pb_migrations/` ไปยังเซิร์ฟเวอร์ PocketBase (เช่น `/opt/pocketbase/pb_migrations/`)
2. รันคำสั่ง:
   ```bash
   ./pocketbase migrate up
   ```
