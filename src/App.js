import React, { useState } from "react";

const Across = ({ children }) => (
  <div style={{ display: "flex" }}>{children}</div>
);
const Down = ({ children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
);

const Application = ({ op, args, onChange }) => (
  <Across>
    {render(op, newOp => onChange({ op: newOp, args }))}
    <Down>
      {args.map((arg, i) =>
        render(arg, newArg =>
          onChange({
            op,
            args: [...args.slice(0, i), newArg, ...args.slice(i + 1)]
          })
        )
      )}
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

export default () => {
  const [ast, setAst] = useState({ type: "Number", value: 6 });

  return (
    <div>
      {render(ast, setAst)}
      <div>Result: {JSON.stringify(evalAst(ast, []))}</div>
    </div>
  );
};

function evalAst(ast, env) {
  switch (ast.type) {
    case "Application":
      return evalAst(ast.caller, env).apply(
        null,
        ast.args.map(arg => evalAst(arg, env))
      );
    case "Number":
      return ast.value;
    case "Variable":
      return env[ast.name] || null;
    default:
      return null;
  }
}
