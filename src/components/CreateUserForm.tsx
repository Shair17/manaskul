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
import { Role } from "@prisma/client";
import { parseRole } from "@/lib/parser";

interface Props {
  roleType: Role;
  backTo: string;
}

export const CreateUserForm: React.FC<Props> = ({ backTo, roleType }) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const avatarUploadInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createUser = api.user.createUser.useMutation({
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

      if (!name || !image || !email) {
        toast.error("Por favor completa los datos!");
        return;
      }

      const imageBase64 = await fileToBase64(image);

      const imageResponse = await axios.post("/api/upload", {
        imageBase64,
        fileName: slugify(
          `${parseRole(roleType).trim().toLowerCase()}-avatar-${nanoid()}-${slugify(name).trim().toLowerCase()}`,
        ),
      });

      const imagePath = imageResponse.data.filePath;

      await createUser.mutateAsync({
        avatar: imagePath,
        name: name.trim(),
        email: email.trim(),
        role: roleType,
      });

      toast.success(`${parseRole(roleType)} creado exitosamente`);
      router.push(`${backTo}`);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Crear Nuevo {parseRole(roleType)}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center">
              <img
                onClick={() => {
                  avatarUploadInputRef.current?.click();
                }}
                src={imagePreview ?? "/avatar.jpg"}
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre(s) y Apellidos</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Nombre completo del ${parseRole(roleType).toLowerCase().trim()}`}
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
            disabled={createUser.isPending || isLoading}
          >
            {createUser.isPending || isLoading
              ? "Creando..."
              : `Crear ${roleType}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
