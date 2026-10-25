import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Shivam Shukla — Products for real people", short_name: "Shivam Shukla", description: "Portfolio of Shivam Shukla, a product builder and Computer Science student.", start_url: "/", display: "standalone", background_color: "#FBFBFD", theme_color: "#FBFBFD" };
}
