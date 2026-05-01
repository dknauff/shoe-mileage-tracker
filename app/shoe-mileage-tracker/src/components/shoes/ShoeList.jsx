import ShoeCard from "./ShoeCard";

export default function ShoeList({
  shoes,
  selectedIndex,
  expandedHistoryIndex,
  onSelectShoe,
  onToggleHistory,
  onRequestDeleteShoe,
  editingLog,
  editLogData,
  onEditLogDataChange,
  onStartEditLog,
  onSaveEditLog,
  onCancelEditLog,
  onRequestDeleteRun,
}) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
      {shoes.map((shoe, index) => (
        <ShoeCard
          key={shoe.id || index}
          shoe={shoe}
          index={index}
          isSelected={selectedIndex === index}
          historyExpanded={expandedHistoryIndex === index}
          onSelect={onSelectShoe}
          onToggleHistory={onToggleHistory}
          onRequestDelete={onRequestDeleteShoe}
          editingLog={editingLog}
          editLogData={editLogData}
          onEditLogDataChange={onEditLogDataChange}
          onStartEditLog={onStartEditLog}
          onSaveEditLog={onSaveEditLog}
          onCancelEditLog={onCancelEditLog}
          onRequestDeleteRun={onRequestDeleteRun}
        />
      ))}
    </ul>
  );
}
