"use client";

import type { Session } from "next-auth";
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { fileToBase64 } from "@/lib/image";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import axios from "axios";
import { nanoid } from "nanoid";

interface Props {
  session: Session | null;
}

export const CompleteProfileForm: React.FC<Props> = ({ session }) => {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const avatarUploadInputRef = useRef<HTMLInputElement>(null);
  const completeProfileMutation = api.user.completeProfile.useMutation({
    onError(error) {
      toast.error(error.message);
    },
  });
  const router = useRouter();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsLoading(true);

      e.preventDefault();

      if (!name || !image) {
        toast.error("Por favor completa tus datos!");
        return;
      }

      const imageBase64 = await fileToBase64(image);

      const imageResponse = await axios.post("/api/upload", {
        imageBase64,
        fileName: slugify(
          `profile-avatar-${nanoid()}-${slugify(name).trim().toLowerCase()}`,
        ),
      });

      const imagePath = imageResponse.data.filePath;

      await completeProfileMutation.mutateAsync({
        avatar: imagePath,
        name: name.trim(),
      });

      toast.success("Perfil completado con éxito!");

      router.refresh();
      router.replace("/");
    } catch (error) {
      toast.error("Ocurrió un error al completar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Completar Perfil</CardTitle>
        <CardDescription>Llena tus datos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-center">
                <img
                  onClick={() => {
                    avatarUploadInputRef.current?.click();
                  }}
                  src={imagePreview ?? session?.user.image ?? "/avatar.jpg"}
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
                required={!Boolean(session?.user.image)}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Nombres y Apellidos</Label>
              <Input
                id="name"
                placeholder="Ingresa tus nombres y apellidos"
                onChange={handleNameChange}
                value={name}
                required
              />
            </div>

            <div className="flex justify-between">
              <Button type="submit" className="ml-auto" disabled={isLoading}>
                {isLoading ? "Cargando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
