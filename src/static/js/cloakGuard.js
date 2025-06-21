if(window.self == window.top)
{
    if (confirm("You don't appear to be cloaked. Do you wish to cloak the page now?")) {
        window.location.href = `/cloak?redirect=${encodeURI(window.location.href)}`;
    }
}