import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface DoughnutChartProps {
  data: ChartData[];
  title?: string;
}

const COLORS = [
  'hsl(217, 91%, 60%)', // primary
  'hsl(142, 86%, 28%)', // success  
  'hsl(0, 84%, 60%)',   // destructive
  'hsl(48, 100%, 67%)', // warning
  'hsl(210, 40%, 95%)', // secondary
  'hsl(215, 16%, 47%)', // muted
];

export const DoughnutChart = ({ data, title }: DoughnutChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="w-full h-80">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};