import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import { useAuthStore } from "../../store/useAuthStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export default function ProfileSetupRoute() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useWorkspaceStore((s) => s.profile);
  const saveProfile = useWorkspaceStore((s) => s.saveProfile);
  const [fullName, setFullName] = useState(profile?.full_name ?? user?.name ?? "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? user?.avatarUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    const name = fullName.trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await saveProfile(user.id, {
        full_name: name,
        job_title: jobTitle.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        onboarding_status: "onboarding_incomplete",
      });
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Finish your profile</h1>
          <p className="text-sm text-text-muted mt-1">
            A few details so your workspace feels like yours.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <TextInput
            label="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Joseph Dilascio"
            required
          />
          <TextInput
            label="Role or title (optional)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Product Designer"
          />
          <TextInput
            label="Avatar URL (optional)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "Saving…" : "Continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}
