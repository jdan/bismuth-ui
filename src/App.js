import React, { useState } from "react";

const Across = ({ children }) => (
  <section style={{ display: "flex" }}>{children}</section>
);
const Down = ({ children }) => (
  <section style={{ display: "flex", flexDirection: "column" }}>
    {children}
  </section>
);

const Swap = ({ value, onChange }) => {
  // Generate this
  const options = [
    {
      type: "Number",
      value: 0
    },
    {
      type: "Variable",
      name: ""
    },
    {
      type: "Application",
      op: {
        type: "Variable",
        name: ""
      },
      args: []
    }
  ];

  return (
    <select
      value={value}
      onChange={e =>
        onChange(options.find(choice => choice.type === e.target.value))
      }
    >
      {options.map((option, i) => (
        <option key={i} value={option.type}>
          {option.type}
        </option>
      ))}
    </select>
  );
};

const Node = ({ name, children, onChange }) => (
  <div className="node">
    <Swap value={name} onChange={onChange} />
    {children}
  </div>
);

const Field = ({ name, children }) => (
  <div className="field">
    <div className="name">{name}</div>
    {children}
  </div>
);

const FieldArray = ({ items, onChangeItems }) => (
  <Down>
    {items.map((item, i) => (
      <div key={i}>
        {render(item, newItem =>
          onChangeItems([...items.slice(0, i), newItem, ...items.slice(i + 1)])
        )}
      </div>
    ))}

    <button
      onClick={e => {
        e.preventDefault();
        // Generate this
        const newItem = { type: "Number", value: 0 };
        onChangeItems([...items, newItem]);
      }}
    >
      +
    </button>
  </Down>
);

const Application = ({ op, args, onChange }) => (
  <Node name="Application" onChange={onChange}>
    <Across>
      <Field name="op">
        <div>
          {render(op, newOp =>
            onChange({
              type: "Application",
              op: newOp,
              args
            })
          )}
        </div>
      </Field>

      <Field name="args">
        <FieldArray
          items={args}
          onChangeItems={newArgs =>
            onChange({ type: "Application", op, args: newArgs })
          }
        />
      </Field>
    </Across>
  </Node>
);

const Number = ({ value, onChange }) => (
  <Node name="Number" onChange={onChange}>
    <Field name="value">
      <input
        onChange={e =>
          onChange({
            type: "Number",
            value: parseInt(e.target.value || 0)
          })
        }
        value={value}
      />
    </Field>
  </Node>
);

const Variable = ({ name, onChange }) => (
  <Node name="Variable" onChange={onChange}>
    <Field name="name">
      <input
        onChange={e =>
          onChange({
            type: "Variable",
            name: e.target.value
          })
        }
        value={name}
      />
    </Field>
  </Node>
);

function render(node, onChange) {
  switch (node.type) {
    case "Application":
      return <Application {...node} onChange={onChange} />;
    case "Number":
      return <Number {...node} onChange={onChange} />;
    case "Variable":
      return <Variable {...node} onChange={onChange} />;
    default:
      return null;
  }
}

const stdlib = {
  "+": (...args) => args.reduce((a, b) => a + b, 0),
  "-": (...args) => args.reduce((a, b) => a - b, 0),
  "*": (...args) => args.reduce((a, b) => a * b, 1),
  "/": (...args) => args.reduce((a, b) => a / b, 1)
};

export default () => {
  const [ast, setAst] = useState({
    type: "Application",
    op: { type: "Variable", name: "+" },
    args: [{ type: "Number", value: 10 }, { type: "Number", value: 100 }]
  });

  return (
    <main>
      <div className="ui">{render(ast, setAst)}</div>
      <div>Result: {JSON.stringify(evalAst(ast, stdlib))}</div>
      <div>
        <pre>
          <code>{JSON.stringify(ast, null, 2)}</code>
        </pre>
      </div>
    </main>
  );
};

function evalAst(ast, env) {
  switch (ast.type) {
    case "Application":
      const f = evalAst(ast.op, env);
      const args = ast.args.map(arg => evalAst(arg, env));

      if (typeof f === "function") return f.apply(null, args);
    case "Number":
      return ast.value;
    case "Variable":
      return env[ast.name] || null;
    default:
      return null;
  }
}
