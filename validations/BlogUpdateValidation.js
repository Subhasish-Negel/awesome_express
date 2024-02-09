import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomErrorReporter.js";

vine.errorReporter = () => new CustomErrorReporter();

export const blogUpdateSchema = vine.object({
  title: vine.string().minLength(10).maxLength(100).optional(),
  content: vine.string().minLength(30).maxLength(30000).optional(),
});
