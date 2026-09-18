const PredictionBadge = ({ item }) => {
  let status = item?.status;

  if (!status) {
    const phLevel = Number(item?.phLevel);
    const turbidity = Number(item?.turbidity);
    const bacteriaCount = Number(item?.bacteriaCount);
    const temperature = Number(item?.temperature);

    if (phLevel < 6.5 || phLevel > 8.5 || bacteriaCount > 0 || turbidity > 5.0 || temperature > 35) {
      status = 'Unsafe';
    } else if (phLevel < 6.8 || phLevel > 8.2 || turbidity > 4.0 || temperature > 30) {
      status = 'Warning';
    } else {
      status = 'Safe';
    }
  }

  const colorClass = status === 'Safe'
    ? 'bg-emerald-500 text-white'
    : status === 'Warning'
    ? 'bg-amber-500 text-slate-900'
    : 'bg-red-500 text-white';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${colorClass}`}>
      {status}
    </span>
  );
};

export default PredictionBadge;