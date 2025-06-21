function escapeHTML(string)
{
    var changedString = string.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/(?:\r\n|\r|\n)/g, '<br>')
    return changedString;
}