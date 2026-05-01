import RunRow from "./RunRow";

export default function RunHistory({
  shoeIndex,
  shoe,
  editingLog,
  editLogData,
  onEditLogDataChange,
  onStartEditLog,
  onSaveEditLog,
  onCancelEditLog,
  onRequestDeleteRun,
}) {
  if (!shoe.logs || shoe.logs.length === 0) return null;

  const isEditingThisShoe = editingLog.shoeIndex === shoeIndex;

  return (
    <div
      style={{
        marginTop: 10,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: 8,
        padding: "10px 4px 4px 4px",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 15,
          tableLayout: "fixed",
          wordBreak: "break-word",
        }}
      >
        {!isEditingThisShoe && (
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.2)" }}>
              {["Date", "Miles", "Run Type", "Location", ""].map((h) => (
                <th key={h} style={{ textAlign: h === "Location" || h === "" ? "left" : "center", padding: "8px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {shoe.logs.map((log, logIndex) => (
            <RunRow
              key={logIndex}
              shoeIndex={shoeIndex}
              logIndex={logIndex}
              log={log}
              isEditing={isEditingThisShoe && editingLog.logIndex === logIndex}
              editLogData={editLogData}
              onEditLogDataChange={onEditLogDataChange}
              onStartEdit={onStartEditLog}
              onSaveEdit={onSaveEditLog}
              onCancelEdit={onCancelEditLog}
              onRequestDelete={onRequestDeleteRun}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
