from django.core.management.base import BaseCommand
from django.urls import get_resolver

class Command(BaseCommand):
    help = 'List all registered URLs'

    def handle(self, *args, **options):
        resolver = get_resolver()
        
        def show_urls(urlpatterns, prefix=''):
            for pattern in urlpatterns:
                if hasattr(pattern, 'url_patterns'):
                    # This is an include()
                    show_urls(pattern.url_patterns, prefix + str(pattern.pattern))
                else:
                    # This is a regular path
                    self.stdout.write(f"{prefix}{pattern.pattern}")
        
        show_urls(resolver.url_patterns)
