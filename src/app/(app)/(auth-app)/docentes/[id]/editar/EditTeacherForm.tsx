"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fileToBase64 } from "@/lib/image";
import axios from "axios";
import slugify from "slugify";
import { nanoid } from "nanoid";
import type { User } from "@prisma/client";

interface Props {
  teacher: User;
}

export const EditTeacherForm: React.FC<Props> = ({ teacher }) => {
  const router = useRouter();
  const [name, setName] = useState(teacher.name ?? "");
  const [email, setEmail] = useState(teacher.email ?? "");
  const avatarUploadInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const editTeacher = api.teacher.editTeacher.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      if (!name) {
        toast.error("Por favor completa los datos!");
        return;
      }

      let imagePath: string | undefined = undefined;

      if (image) {
        const imageBase64 = await fileToBase64(image);

        const imageResponse = await axios.post("/api/upload", {
          imageBase64,
          fileName: slugify(
            `teacher-avatar-${nanoid()}-${slugify(name).trim().toLowerCase()}`,
          ),
        });

        imagePath = imageResponse.data.filePath;
      }

      await editTeacher.mutateAsync({
        id: teacher.id,
        avatar: imagePath,
        name: name.trim(),
        email: email.trim(),
      });

      toast.success("Docente editado exitosamente");
      router.push("/docentes");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Editar Docente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center">
              <img
                onClick={() => {
                  avatarUploadInputRef.current?.click();
                }}
                src={imagePreview ?? teacher.image ?? "/avatar.jpg"}
                alt="Avatar Preview"
                className="size-32 cursor-pointer rounded-full border border-neutral-200 bg-neutral-400"
              />
            </div>

            <Label htmlFor="avatar">Avatar</Label>
            <Input
              ref={avatarUploadInputRef}
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!Boolean(teacher.image)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre(s) y Apellidos</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo del docente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              type="email"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={editTeacher.isPending || isLoading}
          >
            {editTeacher.isPending || isLoading
              ? "Creando..."
              : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
