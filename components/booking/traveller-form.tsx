"use client";

import type { TravellerInput } from "@/lib/validations/booking";

type Props = {
  index: number;
  value: TravellerInput;
  onChange: (index: number, value: TravellerInput) => void;
  errors?: Partial<Record<keyof TravellerInput, string>>;
};

const inputClass =
  "h-11 w-full rounded-lg border border-navy/15 bg-white px-3 text-sm outline-none focus:border-gold";
const labelClass = "mb-1.5 block text-xs font-medium text-navy/60";

export function TravellerForm({ index, value, onChange, errors }: Props) {
  function set<K extends keyof TravellerInput>(key: K, v: TravellerInput[K]) {
    onChange(index, { ...value, [key]: v });
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6">
      <h4 className="mb-4 font-display text-lg font-semibold text-navy">
        Traveller {index + 1}
      </h4>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Full Name *</label>
          <input
            className={inputClass}
            value={value.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            required
          />
          {errors?.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input className={inputClass} value={value.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input className={inputClass} value={value.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Date of Birth</label>
          <input
            type="date"
            className={inputClass}
            value={value.dateOfBirth ?? ""}
            onChange={(e) => set("dateOfBirth", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <select
            className={inputClass}
            value={value.gender ?? ""}
            onChange={(e) => set("gender", e.target.value as TravellerInput["gender"])}
          >
            <option value="">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Govt. ID Type</label>
          <select
            className={inputClass}
            value={value.govtIdType ?? ""}
            onChange={(e) => set("govtIdType", e.target.value)}
          >
            <option value="">Select</option>
            <option value="Aadhaar">Aadhaar</option>
            <option value="PAN">PAN</option>
            <option value="Passport">Passport</option>
            <option value="Driving Licence">Driving Licence</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Govt. ID Number</label>
          <input
            className={inputClass}
            value={value.govtIdNumber ?? ""}
            onChange={(e) => set("govtIdNumber", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Emergency Contact Name</label>
          <input
            className={inputClass}
            value={value.emergencyContactName ?? ""}
            onChange={(e) => set("emergencyContactName", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Emergency Contact Phone</label>
          <input
            className={inputClass}
            value={value.emergencyContactPhone ?? ""}
            onChange={(e) => set("emergencyContactPhone", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Medical / Allergy Information</label>
          <textarea
            className={inputClass + " h-20 py-2"}
            value={value.medicalNotes ?? ""}
            onChange={(e) => set("medicalNotes", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Special Requirements</label>
          <textarea
            className={inputClass + " h-20 py-2"}
            value={value.specialRequirements ?? ""}
            onChange={(e) => set("specialRequirements", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
