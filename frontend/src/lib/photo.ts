// Redimensionne et compresse une photo de profil côté navigateur avant de l'enregistrer
// comme data URI dans le CV (voir la note ATS dans CvEditor.tsx et resumeApi.ts).
//
// Deux raisons de faire ça ici plutôt que d'envoyer le fichier tel quel : la ligne JSON
// stockée en base reste petite (quelques dizaines de Ko au lieu de plusieurs Mo pour une
// photo de smartphone), et le format de sortie est toujours un JPEG carré — celui que les
// deux exporteurs (PDF/DOCX) savent afficher dans un médaillon sans surprise.
const MAX_SIDE = 480;
const JPEG_QUALITY = 0.85;

export async function resizePhotoToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(MAX_SIDE, Math.max(bitmap.width, bitmap.height));

  // Recadrage carré centré : le médaillon rond de l'export attend un carré, un portrait
  // rectangulaire mal cadré donnerait un visage coupé sur un côté.
  const cropSize = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - cropSize) / 2;
  const sy = (bitmap.height - cropSize) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supporté par ce navigateur.");
  ctx.drawImage(bitmap, sx, sy, cropSize, cropSize, 0, 0, side, side);
  bitmap.close?.();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
