import {z} from "zod"

export const COURSE_MATERIAL_MAX_FILE_SIZE = 2 * 1024 * 1024
export const COURSE_MATERIAL_ALLOWED_FILE_TYPES = ["application/pdf"]

export const courseSchema = z.object({
    title:z.string().min(5,"Course Title must contain at least 5 characters")
    .max(30,"Course Title must be under 30 characters")
    .refine((title) => {
      return /^[A-Za-z0-9-&]+(\s[A-Za-z0-9-&]+)*$/.test(title);
    }, {
      message: "Course Title must only contain a single space between words.",
    }),
    description:z.union([z.string().min(10,"Course Description must contain at least 10 characters")
      .max(255,"Course Description must be under 255 characters")
      .refine((description) => !/\s{2,}/.test(description), {
        message: "Course Description must have only a single space between words.",
      }),z.literal("")]),
    courseFiles: z
    .array(
      z.instanceof(File)
    ).optional(),
    students: z.object({
      studentsId: z.array(
        z.object({
          studentID: z.string().refine(id=> /^\d{7,12}$/.test(id),"The student ID must be between 7 to 12 digits")
        }))
        .optional(), 
      file: z.instanceof(File).refine((file) =>file.type === "text/csv", {
        message: "Only CSV files are allowed.",
      })
      .refine((file) => file.size < 7 * 1024 * 1024, { 
        message: "File size must be less than 2MB.",
      }).nullable() 
    })/* .refine((data) => { 
      return data.file ? true:false || data.studentsId.length > 0;
    }, {
      message: "Either student IDs or a file must be provided.",
    }) */
  })