import { redirect } from "next/navigation";

// Redirige la ruta antigua /recomendation a la ruta unificada /recommendation.
export default function Recomendation() {
  redirect("/recommendation?type=mood");
}
