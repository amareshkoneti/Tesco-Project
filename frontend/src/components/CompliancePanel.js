const CompliancePanel = ({ compliance }) => {
      return (
        <div className="card p-4 text-start">
          <h5 className="text-danger fw-bold mb-3">
            ❌ Compliance Failed... Try Generating Again
          </h5>

          <p className="mb-2">
            <strong>Reason:</strong> {compliance.reason}
          </p>

          <ul className="list-group">
            {compliance.details
              .filter(d => d.result === "fail")
              .map((d, i) => (
                <li key={i} className="list-group-item text-danger">
                  <strong>{d.rule}:</strong> {d.explain}
                </li>
              ))}
          </ul>
        </div>
      );
    };
export default CompliancePanel;