const ROLES = {
    student:[
        "view:courses",
        "view:course-conversation",
    ],
    instructor:[
        "view:courses",
        "view:course",
        "view:course-conversation",
        "create:course",
        "delete:course",
        "edit:course",
        "view:source"
    ]
    
}

export function hasPermission(
    user,
    permission
)
{
    return (ROLES[user.role]).includes(permission)
}