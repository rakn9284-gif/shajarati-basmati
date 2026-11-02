"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Search,
  ShieldCheck,
  ShieldOff,
  UserCog,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ROLE_META } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";
import { Avatar, Badge, SectionHeading } from "./ui";

export default function UserManagement() {
  const { t, lang, user, users, municipalities, assignRole, notify } = useApp();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "volunteer" | "municipality_admin">("all");

  const isAdmin = user?.role === "state_admin";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (u.id === user?.id) return false; // state admin row is out of scope here
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesQuery =
        !q ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [users, user, query, roleFilter, municipalities]);

  // municipality name lookup from the live computed list
  const nameOf = (municipalityId?: string) => {
    const m = municipalities.find((x) => x.id === municipalityId);
    if (!m) return "—";
    return lang === "ar" ? m.nameAr : m.nameEn;
  };

  const promote = (userId: string, municipalityId: string) => {
    if (!municipalityId) {
      notify(
        "اختر بلدية أولاً لمنح الإشراف البلدي.",
        "Choose a municipality before granting municipal admin.",
        "error",
      );
      return;
    }
    assignRole(userId, "municipality_admin", municipalityId);
  };

  const demote = (userId: string) => {
    assignRole(userId, "volunteer", undefined);
  };

  if (!isAdmin) {
    return (
      <SectionHeading
        eyebrow={t("إدارة المستخدمين", "User management")}
        title={t("غير مصرح لك", "Not authorized")}
        subtitle={t(
          "إدارة المستخدمين متاحة لأدمن الولاية فقط.",
          "User management is reserved for the state admin.",
        )}
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow={t("أدمن الولاية", "State admin")}
        title={t("إدارة المستخدمين", "User management")}
        subtitle={t(
          "ترقية المتطوعين إلى أدمن بلدية، أو إلغاء الترقية والعودة بهم إلى التطوع.",
          "Promote volunteers to municipality admins, or revoke them back to volunteer.",
        )}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-charcoal/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("بحث بالاسم أو البريد…", "Search by name or email…")}
            className="w-full rounded-full border border-line bg-white py-2.5 pe-3 ps-9 text-[12px] outline-none focus:border-brand"
          />
        </div>
        <div className="flex gap-1 rounded-full border border-line bg-white p-1 text-[11px] font-semibold">
          {(
            [
              { id: "all", ar: "الكل", en: "All" },
              { id: "volunteer", ar: "متطوعون", en: "Volunteers" },
              { id: "municipality_admin", ar: "أدمن بلدية", en: "Muni admins" },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              onClick={() => setRoleFilter(chip.id)}
              className={
                roleFilter === chip.id
                  ? "rounded-full bg-forest px-3 py-1.5 text-white"
                  : "rounded-full px-3 py-1.5 text-charcoal/55"
              }
            >
              {t(chip.ar, chip.en)}
            </button>
          ))}
        </div>
        <Badge tone="mint">
          <Users className="size-3" />
          {formatNumber(filtered.length, lang)}
        </Badge>
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white">
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[12px] font-semibold text-charcoal/55">
              {t("لا يوجد مستخدمون مطابقون.", "No matching users.")}
            </p>
            <p className="mt-1 text-[10px] text-charcoal/35">
              {t(
                "تُنشأ الحسابات عن طريق التسجيل التطوعي.",
                "Accounts are created through volunteer sign-up.",
              )}
            </p>
          </div>
        ) : (
          filtered.map((u) => {
            const meta = ROLE_META[u.role];
            return (
              <div
                key={u.id}
                className="flex flex-wrap items-center gap-3 border-b border-line/60 px-4 py-3 last:border-0"
              >
                <Avatar
                  first={u.firstName}
                  last={u.lastName}
                  color={u.avatarColor}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-forest">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="truncate text-[10px] text-charcoal/45" dir="ltr">
                    {u.email}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-1">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10.5px] font-bold"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {lang === "ar" ? meta.ar : meta.en}
                  </span>
                  <span className="text-[9.5px] text-charcoal/40">
                    {nameOf(u.municipalityId)} · {formatDate(u.joinedAt, lang)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {u.role === "municipality_admin" ? (
                    <button
                      onClick={() => demote(u.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#F3C7C7] bg-[#FBE7E7] px-3 py-2 text-[10.5px] font-bold text-[#B03636] transition hover:bg-[#f8dcdc]"
                    >
                      <ShieldOff className="size-3.5" />
                      {t("إلغاء الترقية", "Revoke")}
                    </button>
                  ) : (
                    <PromotePicker
                      municipalities={municipalities.map((m) => ({
                        id: m.id,
                        nameAr: m.nameAr,
                        nameEn: m.nameEn,
                      }))}
                      onPromote={(municipalityId) => promote(u.id, municipalityId)}
                      labels={{
                        promote: t("ترقية", "Promote"),
                        choose: t("اختر البلدية", "Choose municipality"),
                        cta: t("تعيين أدمن", "Assign admin"),
                      }}
                    />
                  )}
                  <span className="hidden text-[9.5px] text-charcoal/35 sm:block">
                    <UserCog className="me-1 inline size-3 text-brand" />
                    {t(`سقى ${u.treesWatered} فحص سقاية`, `${u.treesWatered} waterings logged`)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="flex items-center gap-1.5 rounded-2xl bg-mint-soft/60 px-4 py-3 text-[10px] font-medium text-brand-dark/80">
        <ShieldCheck className="size-4 shrink-0 text-brand" />
        {t(
          "لكل بلدية أدمن واحد؛ تعيين أدمن جديد في بلدية ما يترك الحساب السابق بلا دور إشرافي.",
          "Each municipality has one admin; assigning a new admin replaces the previous one.",
        )}
      </p>
    </div>
  );
}

function PromotePicker({
  municipalities,
  onPromote,
  labels,
}: {
  municipalities: { id: string; nameAr: string; nameEn: string }[];
  onPromote: (municipalityId: string) => void;
  labels: { promote: string; choose: string; cta: string };
}) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-mint-soft px-3 py-2 text-[10.5px] font-bold text-brand-dark transition hover:border-brand/40"
      >
        <ShieldCheck className="size-3.5 text-brand" />
        {labels.promote}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <select
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="w-[150px] appearance-none rounded-xl border border-line bg-white py-2 pe-8 ps-3 text-[10.5px] font-semibold text-forest outline-none focus:border-brand"
          aria-label={labels.choose}
        >
          <option value="">{labels.choose}</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nameAr} / {m.nameEn}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 size-3 -translate-y-1/2 text-charcoal/40" />
      </div>
      <button
        onClick={() => {
          if (!choice) return;
          onPromote(choice);
          setOpen(false);
          setChoice("");
        }}
        disabled={!choice}
        className="rounded-xl bg-forest px-3 py-2 text-[10.5px] font-bold text-white transition hover:bg-brand-dark disabled:opacity-40"
      >
        {labels.cta}
      </button>
    </div>
  );
}
