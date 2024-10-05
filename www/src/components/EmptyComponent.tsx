interface EmptyComponentProps {
  title: string;
}

const EmptyComponent = ({ title }: EmptyComponentProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">
        Este es un componente vacío para futura implementación.
      </p>
    </div>
  );
};

export default EmptyComponent;
