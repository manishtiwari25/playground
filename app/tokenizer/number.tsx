import { Card, CardBody } from "@heroui/react";

export const Number = ({ title, count }: { title: string; count: number }) => {
  return (
    <div>
      <Card className="bg-transparent text-black dark:text-white">
        <CardBody>
          <p className="text-muted text-center">{title}</p>
          <p className="text-4xl text-center">{count}</p>
        </CardBody>
      </Card>
    </div>
  );
};
