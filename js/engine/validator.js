const VALID_COMMANDS = new Set([
  'move', 'turnRight', 'turnLeft', 'jump',
  'attack', 'custom_var', 'set_var', 'change_var',
  'if', 'repeat', 'while'
]);

const CONTROL_COMMANDS = new Set(['if', 'repeat', 'while']);

const COMMANDS_WITH_VALUE = new Set(['move', 'jump', 'repeat', 'set_var', 'change_var']);

const VALID_CONDITIONS = new Set(['obstacleDetected', 'enemyDetected']);

const MAX_DEPTH = 6;
const MAX_TOTAL_COMMANDS = 500;
const MAX_REPEAT_COUNT = 100;
const MAX_WHILE_ITERATIONS = 200;

export class ValidationResult {
  constructor() {
    this.valid = true;
    this.errors = [];
    this.warnings = [];
  }

  addError(message) {
    this.valid = false;
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  getAllMessages() {
    return [
      ...this.errors.map(m => ({ type: 'error', message: m })),
      ...this.warnings.map(m => ({ type: 'warning', message: m }))
    ];
  }
}

export function validateCommands(commands) {
  const result = new ValidationResult();

  if (!Array.isArray(commands)) {
    result.addError('Comandos inválidos: esperava uma lista de comandos.');
    return result;
  }

  if (commands.length === 0) {
    result.addWarning('Nenhum bloco no workspace. Arraste blocos da paleta antes de executar.');
    return result;
  }

  for (let i = 0; i < commands.length; i++) {
    validateNode(commands[i], result, 0, `#${i + 1}`);
  }

  return result;
}

function validateNode(node, result, depth, path) {
  if (depth > MAX_DEPTH) {
    result.addError(`${path}: Profundidade máxima de ${MAX_DEPTH} níveis excedida. Reduza o aninhamento.`);
    return;
  }

  if (!node || typeof node !== 'object') {
    result.addError(`${path}: Comando inválido (não é um objeto).`);
    return;
  }

  if (!node.type) {
    result.addError(`${path}: Comando sem tipo definido.`);
    return;
  }

  if (!VALID_COMMANDS.has(node.type)) {
    result.addError(`${path}: Comando "${node.type}" não existe. Verifique a ortografia.`);
    return;
  }

  if (COMMANDS_WITH_VALUE.has(node.type) && node.type !== 'repeat') {
    validateNumericValue(node, result, path);
  }

  if (node.type === 'set_var') {
    validateSetVar(node, result, path);
  }

  if (node.type === 'change_var') {
    validateChangeVar(node, result, path);
  }

  if (CONTROL_COMMANDS.has(node.type)) {
    validateControlBlock(node, result, depth, path);
  }
}

function validateNumericValue(node, result, path) {
  if (node.value !== undefined && node.value !== null) {
    const val = Number(node.value);
    if (isNaN(val) || !Number.isInteger(val) || val < 1) {
      result.addError(`${path} (${node.type}): Valor "${node.value}" inválido. Use um número inteiro positivo.`);
    }
  }
}

function validateControlBlock(node, result, depth, path) {
  switch (node.type) {
    case 'if':
      validateIf(node, result, depth, path);
      break;
    case 'repeat':
      validateRepeat(node, result, depth, path);
      break;
    case 'while':
      validateWhile(node, result, depth, path);
      break;
  }
}

function validateIf(node, result, depth, path) {
  if (!node.condition) {
    result.addError(`${path} (Se): Nenhuma condição definida. Clique no hexágono para definir a condição.`);
  } else if (!VALID_CONDITIONS.has(node.condition)) {
    result.addError(`${path} (Se): Condição "${node.condition}" inválida. Use "Obstáculo" ou "Inimigo".`);
  }

  const hasChildren = node.children && node.children.length > 0;
  const hasElse = node.elseChildren && node.elseChildren.length > 0;

  if (!hasChildren && !hasElse) {
    result.addWarning(`${path} (Se): Bloco vazio — nada será executado. Adicione blocos dentro do "Se" ou "Senão".`);
  }

  if (hasChildren) {
    for (let i = 0; i < node.children.length; i++) {
      validateNode(node.children[i], result, depth + 1, `${path} (Se > então) > #${i + 1}`);
    }
  }

  if (hasElse) {
    for (let i = 0; i < node.elseChildren.length; i++) {
      validateNode(node.elseChildren[i], result, depth + 1, `${path} (Se > senão) > #${i + 1}`);
    }
  }
}

function validateRepeat(node, result, depth, path) {
  const hasValue = node.value !== undefined && node.value !== null;

  if (!hasValue) {
    result.addError(`${path} (Repetir): Número de repetições obrigatório. Preencha o círculo branco no bloco.`);
  } else {
    const count = Number(node.value);
    if (isNaN(count) || count < 1) {
      result.addError(`${path} (Repetir): Número inválido "${node.value}". Use um número inteiro positivo.`);
    } else if (count > MAX_REPEAT_COUNT) {
      result.addWarning(`${path} (Repetir): ${count} repetições excede o limite de ${MAX_REPEAT_COUNT}. Será limitado a ${MAX_REPEAT_COUNT}.`);
    }
  }

  if (!node.children || node.children.length === 0) {
    result.addWarning(`${path} (Repetir): Bloco vazio — nada será repetido.`);
  } else {
    for (let i = 0; i < node.children.length; i++) {
      validateNode(node.children[i], result, depth + 1, `${path} (Repetir) > #${i + 1}`);
    }
  }
}

function validateWhile(node, result, depth, path) {
  if (!node.condition) {
    result.addError(`${path} (Enquanto): Nenhuma condição definida. Clique no hexágono para definir a condição.`);
  } else if (!VALID_CONDITIONS.has(node.condition)) {
    result.addError(`${path} (Enquanto): Condição "${node.condition}" inválida. Use "Obstáculo" ou "Inimigo".`);
  }

  if (node.condition && node.children && node.children.length > 0) {
    const hasMovement = node.children.some(c =>
      ['move', 'turnRight', 'turnLeft', 'jump'].includes(c.type)
    );

    const hasInnerControl = node.children.some(c =>
      CONTROL_COMMANDS.has(c.type)
    );

    if (!hasMovement && !hasInnerControl) {
      result.addWarning(`${path} (Enquanto): Loop potencialmente infinito — nenhum movimento ou controle dentro da condição "${node.condition}". A execução será limitada a ${MAX_WHILE_ITERATIONS} iterações.`);
    }
  }

  if (!node.children || node.children.length === 0) {
    result.addWarning(`${path} (Enquanto): Bloco vazio — nada será repetido.`);
  } else {
    for (let i = 0; i < node.children.length; i++) {
      validateNode(node.children[i], result, depth + 1, `${path} (Enquanto) > #${i + 1}`);
    }
  }
}

function validateSetVar(node, result, path) {
  if (!node.varName || node.varName.trim() === '') {
    result.addError(`${path} (Definir): Nenhuma variável selecionada. Selecione uma variável no menu.`);
  }
}

function validateChangeVar(node, result, path) {
  if (!node.varName || node.varName.trim() === '') {
    result.addError(`${path} (Alterar): Nenhuma variável selecionada. Selecione uma variável já definida.`);
  }
}

export { MAX_TOTAL_COMMANDS, MAX_REPEAT_COUNT, MAX_WHILE_ITERATIONS };
