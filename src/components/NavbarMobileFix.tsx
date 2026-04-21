'use client';

import { useEffect, useState } from "react";
import Navbar from "./Navbar"; 

// Temporary fix component - replace with fixed Navbar
export default function NavbarMobileFix() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth > 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return isDesktop ? <Navbar /> : <div>Desktop Navbar (mobile coming)</div>;
}

