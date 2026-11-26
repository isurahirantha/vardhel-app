import { getTranslations } from "next-intl/server";
import { getApprovedFeedback } from "@/server/services/public-content.service";
import { FeedbackForm } from "@/components/sections/feedback-form";
import { FeedbackAvatar } from "@/components/ui/feedback-avatar";
import { Star } from "lucide-react";

export const revalidate = 60;

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";

  const [feedbackList, tForm] = await Promise.all([
    getApprovedFeedback(validLocale),
    getTranslations({ locale: validLocale, namespace: "form" }),
  ]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-[length:var(--text-h1)] font-bold text-white">
          {validLocale === "si"
            ? "පාරිභෝගික අත්දැකීම් සහ අදහස්"
            : "Customer Feedback & Experiences"}
        </h1>
        <p className="mt-3 text-base text-slate-300">
          {validLocale === "si"
            ? "Vardhel සමඟ කටයුතු කිරීමේ ඔබේ අත්දැකීම බෙදාගන්න."
            : "Read verified reviews from our partners or share your experience working with Vardhel."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        {/* Submit Feedback Form */}
        <div className="lg:col-span-5">
          <h2 className="mb-4 text-xl font-bold text-white">
            {validLocale === "si"
              ? "ඔබේ අදහස යොමු කරන්න"
              : "Share Your Experience"}
          </h2>
          <FeedbackForm
            locale={validLocale}
            labels={{
              name: tForm("name"),
              email: tForm("email"),
              businessName: tForm("business_name"),
              message: tForm("message"),
              consent: tForm("consent_feedback"),
              submit: tForm("submit_feedback"),
              success: tForm("feedback_success"),
            }}
          />
        </div>

        {/* Approved Testimonials List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-white">
            {validLocale === "si"
              ? "අනුමත කරන ලද පාරිභෝගික අදහස්"
              : "Published Client Reviews"}
          </h2>
          {feedbackList.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-sm text-slate-400">
              {validLocale === "si"
                ? "ඔබේ අත්දැකීම පළමුවෙන්ම බෙදාගන්න! අනුමැතියෙන් පසු මෙහි දිස්වනු ඇත."
                : "Be the first to share your experience! Approved client reviews appear here."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="glass-card rounded-2xl p-6 space-y-3"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-200">&ldquo;{fb.message}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 text-xs">
                    <FeedbackAvatar name={fb.name} avatarUrl={fb.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{fb.name}</p>
                      {(fb.role || fb.company) && (
                        <p className="truncate text-slate-400">
                          {fb.role} {fb.company ? `@ ${fb.company}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
