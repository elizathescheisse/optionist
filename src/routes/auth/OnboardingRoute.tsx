import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import GuestOnly from "../../components/auth/GuestOnly";
import Button from "../../components/shared/Button";
import TextInput from "../../components/shared/TextInput";
import { useAuthStore, type OnboardingAnswers } from "../../store/useAuthStore";
import { useAppStore } from "../../store/useAppStore";
import { seedDemoDecisions } from "../../utils/demoSeed";
import { cn } from "../../utils/cn";

const STEPS = [
  {
    id: "role",
    question: "What best describes your role?",
    helper: "This helps us tailor your workspace.",
    options: [
      "Product Designer",
      "UX Lead / Manager",
      "Product Manager",
      "Researcher",
      "Executive / Stakeholder",
      "Other",
    ],
  },
  {
    id: "useCase",
    question: "What will you use Optionist for most?",
    helper: "Pick the closest match.",
    options: [
      "Comparing design directions",
      "Presenting options to leadership",
      "Capturing stakeholder feedback",
      "Documenting design decisions",
      "Reviewing product experiments",
    ],
  },
  {
    id: "audience",
    question: "Who are you usually presenting options to?",
    helper: "Think about your typical review audience.",
    options: [
      "Product teams",
      "Executives",
      "Clients",
      "Engineering partners",
      "Design team",
      "Mixed audience",
    ],
  },
  {
    id: "decisionStyle",
    question: "How do you usually make design decisions?",
    helper: "There's no wrong answer here.",
    options: [
      "I recommend one direction",
      "I present multiple equal options",
      "I collect votes",
      "I facilitate discussion",
      "It depends on the project",
    ],
  },
] as const;

export default function OnboardingRoute() {
  const navigate = useNavigate();
  const loginFromOnboarding = useAuthStore((s) => s.loginFromOnboarding);
  const createProject = useAppStore((s) => s.createProject);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [workspaceName, setWorkspaceName] = useState("");
  const [comparingFirst, setComparingFirst] = useState("");

  const isChoiceStep = step < STEPS.length;
  const currentStep = STEPS[step];
  const currentAnswer = isChoiceStep ? answers[currentStep?.id ?? ""] : workspaceName.trim();

  function handleSelect(value: string) {
    if (!currentStep) return;
    setAnswers((prev) => ({ ...prev, [currentStep.id]: value }));
  }

  function handleContinue() {
    if (isChoiceStep) {
      setStep((s) => s + 1);
      return;
    }

    const onboardingAnswers: OnboardingAnswers = {
      role: answers.role ?? "",
      useCase: answers.useCase ?? "",
      audience: answers.audience ?? "",
      decisionStyle: answers.decisionStyle ?? "",
      workspaceName: workspaceName.trim(),
      comparingFirst: comparingFirst.trim() || undefined,
      completedAt: new Date().toISOString(),
    };

    const projectId = createProject({
      name: workspaceName.trim(),
      description: comparingFirst.trim() || "My first workspace",
    });

    seedDemoDecisions(projectId);
    loginFromOnboarding(onboardingAnswers);
    navigate("/dashboard");
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
    else navigate("/signup");
  }

  const totalSteps = STEPS.length + 1;

  return (
    <GuestOnly>
      <AuthLayout>
        <div className="flex flex-col gap-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>

          <p className="text-xs text-text-soft font-medium">
            Step {step + 1} of {totalSteps}
          </p>

          {isChoiceStep && currentStep ? (
            <>
              <div>
                <h1 className="text-lg font-semibold text-text">{currentStep.question}</h1>
                <p className="text-sm text-text-muted mt-1">{currentStep.helper}</p>
              </div>
              <div className="flex flex-col gap-2">
                {currentStep.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "text-left px-4 py-3 rounded-lg border text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      answers[currentStep.id] === option
                        ? "border-primary bg-primary-soft text-primary font-medium"
                        : "border-border bg-surface hover:border-primary/40 text-text",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-semibold text-text">
                  What should we call your first workspace?
                </h1>
                <p className="text-sm text-text-muted mt-1">
                  You can rename this later.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <TextInput
                  label="Workspace name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Example: Financial Dashboard Direction"
                  required
                />
                <TextInput
                  label="What are you comparing first? (optional)"
                  value={comparingFirst}
                  onChange={(e) => setComparingFirst(e.target.value)}
                  placeholder="Dashboard concepts, homepage layouts…"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!currentAnswer}
              onClick={handleContinue}
            >
              {step === totalSteps - 1 ? "Complete setup" : "Continue"}
            </Button>
          </div>
        </div>
      </AuthLayout>
    </GuestOnly>
  );
}
