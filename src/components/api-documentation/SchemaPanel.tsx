import type { ApiSchemaDoc } from "@/lib/api-route-catalog";

type SchemaPanelProps = {
  schemas: ApiSchemaDoc[];
};

/** Zod schema reference tables for API documentation */
export function SchemaPanel({ schemas }: SchemaPanelProps) {
  return (
    <div className="space-y-6">
      {schemas.map((schema) => (
        <div key={schema.name} className="api-status-card">
          <div className="api-status-card__header">
            <h3 className="api-status-card__title">{schema.name}</h3>
            <p className="api-status-card__description">{schema.description}</p>
          </div>
          <div className="api-status-card__content overflow-x-auto">
            <table className="api-status-schema-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                </tr>
              </thead>
              <tbody>
                {schema.fields.map((f) => (
                  <tr key={`${schema.name}-${f.name}`}>
                    <td>
                      <code>{f.name}</code>
                    </td>
                    <td>{f.type}</td>
                    <td>{f.required ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
