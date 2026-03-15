export const parseArgs = (args) => {
  if (!args || args.length === 0) return { command: null, options: {} };

  const command = args[0];
  const options = {};

  let i = 1;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        options[key] = next;
        i += 2;
      } else {
        options[key] = true;
        i++;
      }
    } else {
      options.path = arg;
      i++;
    }
  }

  return { command, options };
};