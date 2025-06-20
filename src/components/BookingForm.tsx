
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^(\+966|966|05)[0-9]{8}$/, "Please enter a valid Saudi mobile number"),
  email: z.string().email("Please enter a valid email address"),
  messageToOwner: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  car: {
    id: number;
    name: string;
    price: string;
    ownerId: string;
  };
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onCancel: () => void;
}

const BookingForm = ({ car, startDate, endDate, totalPrice, onSubmit, onCancel }: BookingFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      messageToOwner: "",
    },
  });

  const calculateDays = () => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleFormSubmit = async (data: BookingFormData) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Booking submission error:", error);
      toast({
        title: t("common.error"),
        description: t("bookingForm.submitError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-black">{t("bookingForm.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
          <h3 className="font-semibold text-black">{t("bookingForm.summaryTitle")}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("bookingForm.summary.car")}:</span>
              <span className="font-medium text-black">{car.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("bookingForm.summary.pickupDate")}:</span>
              <span className="text-black">{startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("bookingForm.summary.returnDate")}:</span>
              <span className="text-black">{endDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("bookingForm.summary.duration")}:</span>
              <span className="text-black">
                {calculateDays()} {t("bookingForm.summary.days", { count: calculateDays() })}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold border-gray-200">
              <span className="text-black">{t("bookingForm.summary.totalAmount")}:</span>
              <span className="text-black">{t("common.currency")} {totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-black">
              {t("bookingForm.fields.fullName")} *
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder={t("bookingForm.placeholders.fullName")}
              className="border-gray-300 focus:border-black focus:ring-black"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-black">
              {t("bookingForm.fields.mobile")} *
            </Label>
            <Input
              id="mobile"
              {...form.register("mobile")}
              placeholder={t("bookingForm.placeholders.mobile")}
              className="border-gray-300 focus:border-black focus:ring-black"
            />
            {form.formState.errors.mobile && (
              <p className="text-sm text-red-600">{form.formState.errors.mobile.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-black">
              {t("bookingForm.fields.email")} *
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder={t("bookingForm.placeholders.email")}
              className="border-gray-300 focus:border-black focus:ring-black"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageToOwner" className="text-black">
              {t("bookingForm.fields.message")}
            </Label>
            <Textarea
              id="messageToOwner"
              {...form.register("messageToOwner")}
              placeholder={t("bookingForm.placeholders.message")}
              rows={3}
              className="border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
            <p className="text-sm text-gray-800">
              <strong className="text-black">{t("bookingForm.noteTitle")}</strong>{" "}
              {t("bookingForm.note")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-300 text-black hover:bg-gray-50"
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("bookingForm.buttons.submitting")
                : t("bookingForm.buttons.submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
