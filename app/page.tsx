"use client";

import { Card, CardBody } from "@nextui-org/card";
import { useRouter } from "next/navigation";
import { Image } from "@nextui-org/image";

import { subtitle, title } from "@/components/primitives";
import { siteConfig } from "@/config/site";
export default function Home() {
  let router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title({ color: "violet" })}>AI&nbsp;</h1>
          <h1 className={title()}>Playground&nbsp;</h1>

          <h2 className={subtitle({ class: "mt-4" })}>
            Using Onnx runtime, web-llm, mlc-llm, transformer.js.
          </h2>
        </div>
        <div className="inline-block  max-w-lg grid grid-cols-2 gap-4">
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
                  <Image alt={x.name} src={x.screenshot} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
