import React, { useState } from "react";

const Across = ({ children }) => (
  <section style={{ display: "flex" }}>{children}</section>
);
const Down = ({ children }) => (
  <section style={{ display: "flex", flexDirection: "column" }}>
    {children}
  </section>
);

const Application = ({ op, args, onChange }) => (
  <Across>
    <div>
      {render(op, newOp =>
        onChange({
          type: "Application",
          op: newOp,
          args
        })
      )}
    </div>
    <Down>
      {args.map((arg, i) => (
        <div key={i}>
          {render(arg, newArg =>
            onChange({
              type: "Application",
              op,
              args: [...args.slice(0, i), newArg, ...args.slice(i + 1)]
            })
          )}
        </div>
      ))}
    </Down>
  </Across>
);

const Number = ({ value, onChange }) => (
  <input
    onChange={e =>
      onChange({
        type: "Number",
        value: parseInt(e.target.value || 0)
      })
    }
    value={value}
  />
);

const Variable = ({ name, onChange }) => (
  <input
    onChange={e =>
      onChange({
        type: "Variable",
        name: e.target.value
      })
    }
    value={name}
  />
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
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b
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
