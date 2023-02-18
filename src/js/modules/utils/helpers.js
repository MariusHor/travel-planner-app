export const focusElement = element => {
  if (element) element.focus();
};

export const capitalize = string => string.at(0).toUpperCase() + string.slice(1);

export const removeElClasses = (element, obj) => {
  if (element) element.classList.remove(...obj.classes);
};
