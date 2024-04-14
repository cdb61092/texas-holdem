import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { AccountMenu } from "~/components/AccountMenu";
import { Link } from "@remix-run/react";
import { ThemeToggle } from "~/components/ThemeToggle";

const links = [
  { name: "Profile", href: "/profile" },
  { name: "Tables", href: "/tables" },
];

export function Navigation() {
  return (
    <div className="flex justify-between w-full">
      <NavigationMenu>
        <NavigationMenuList>
          {links.map((link) => {
            return (
              <NavigationMenuItem key={link.name}>
                <Link to={link.href} className={navigationMenuTriggerStyle()}>
                  {link.name}
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <ThemeToggle />
      <AccountMenu />
    </div>
  );
}
