"use client";

import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import { Image } from "@heroui/image";
import { useState } from "react";

import { subtitle, title } from "@/components/primitives";
import { siteConfig } from "@/config/site";
export default function Home() {
  let router = useRouter();

  const [hoverStates, setHoverStates] = useState<{
    [key: string]: boolean;
  }>({});

  const handleMouseOver = (name: string) => {
    setHoverStates((prevStates) => ({ ...prevStates, [name]: true }));
  };

  const handleMouseOut = (name: string) => {
    setHoverStates((prevStates) => ({ ...prevStates, [name]: false }));
  };

  const handleFocus = (name: string) => {
    setHoverStates((prevStates) => ({ ...prevStates, [name]: true }));
  };

  const handleBlur = (name: string) => {
    setHoverStates((prevStates) => ({ ...prevStates, [name]: false }));
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="p-4">
        <div className="text-center justify-center">
          <h1 className={title({ color: "violet" })}>AI&nbsp;</h1>
          <h1 className={title()}>Playground&nbsp;</h1>

          <h2 className={subtitle({ class: "mt-4" })}>
            Using Onnx runtime, web-llm, mlc-llm, transformer.js.
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {siteConfig.demos.map((x) => (
            <Card key={x.name} isPressable onPress={() => router.push(x.href)}>
              <CardBody>
                <div>
                  <h1 className="text-xl font-bold">{x.name}</h1>
                  {x.model && (
                    <h3 className="text-xs">
                      Using <span className="font-bold">{x.model}</span>
                    </h3>
                  )}
                  <div
                    className="relative"
                    onBlur={() => handleBlur(x.name)}
                    onFocus={() => handleFocus(x.name)}
                    onMouseOut={() => handleMouseOut(x.name)}
                    onMouseOver={() => handleMouseOver(x.name)}
                  >
                    {!hoverStates[x.name] && (
                      <Image
                        alt={x.name}
                        className="relative"
                        src={x.screenshot}
                      />
                    )}
                    {hoverStates[x.name] && (
                      <Image alt={x.name} className="relative" src={x.demo} />
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
