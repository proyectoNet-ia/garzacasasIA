export function Footer() {
    return (
        <footer className="border-t border-white/5 py-12 bg-black text-zinc-500">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-lg font-black text-white px-4 py-1 border border-white/10 rounded-xl bg-white/5">
                        Garza Casas <span className="text-blue-500">IA</span>
                    </div>
                    <p className="text-sm font-medium">© 2024 Garza Casas IA. Todos los derechos reservados.</p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Contacto</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
