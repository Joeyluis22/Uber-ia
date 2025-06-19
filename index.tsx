/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('App loaded.');

    const verifyButton = document.querySelector('.verify-button') as HTMLButtonElement | null;
    const swipeTrack = document.getElementById('swipeTrack') as HTMLDivElement | null;
    const verificationBanner = document.querySelector('.verification-banner') as HTMLDivElement | null;
    const orderEtaElement = document.querySelector('.order-eta') as HTMLParagraphElement | null;
    const detailsArrowIcon = document.querySelector('.order-card .details-arrow-icon') as HTMLDivElement | null;
    const verifiedCheckmarkIcon = document.querySelector('.verified-checkmark-icon') as HTMLDivElement | null;
    const orderCard = document.querySelector('.order-card') as HTMLElement | null;
    const helpSupportSection = document.getElementById('helpSupportSection') as HTMLElement | null;
    const orderVerificationDivider = document.getElementById('orderVerificationDivider') as HTMLDivElement | null;
    const contentFooterDivider = document.getElementById('contentFooterDivider') as HTMLDivElement | null;

    const swipeHandle = document.getElementById('swipeHandle') as HTMLDivElement | null;
    const swipeTextBaseLayer = document.getElementById('swipeTextBaseLayer') as HTMLElement | null;
    const swipeProgressFill = document.getElementById('swipeProgressFill') as HTMLDivElement | null;
    const swipeTextOverlayLayer = document.getElementById('swipeTextOverlayLayer') as HTMLElement | null;

    const arrowIconSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"/></svg>`;
    const checkmarkIconSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;

    let isDragging = false;
    let startX = 0;
    let offsetX = 0;
    let isSwipeCompleted = false;
    let trackPaddingLeft = 0;
    let trackPaddingRight = 0;
    let cachedHandleWidth = 0;


    if (verifyButton && swipeTrack && orderCard && swipeHandle && swipeTextBaseLayer && swipeProgressFill && swipeTextOverlayLayer) {
        const computedTrackStyle = getComputedStyle(swipeTrack);
        trackPaddingLeft = parseFloat(computedTrackStyle.paddingLeft) || 0;
        trackPaddingRight = parseFloat(computedTrackStyle.paddingRight) || 0;
        cachedHandleWidth = swipeHandle.offsetWidth;

        verifyButton.addEventListener('click', () => {
            console.log('Botón "Verifica este pedido" presionado.');

            if (verificationBanner) verificationBanner.style.display = 'none';
            if (orderEtaElement) orderEtaElement.style.display = 'none';
            if (detailsArrowIcon) detailsArrowIcon.style.display = 'none';
            if (verifiedCheckmarkIcon) verifiedCheckmarkIcon.style.display = 'flex';
            if (verifyButton) verifyButton.style.display = 'none';
            if (orderCard) orderCard.classList.add('is-verified');
            if (orderVerificationDivider) orderVerificationDivider.style.display = 'block';
            if (helpSupportSection) helpSupportSection.style.display = 'block';
            if (contentFooterDivider) contentFooterDivider.classList.add('large-empty-block');

            swipeTrack.classList.remove('is-disabled', 'is-completed');
            swipeTrack.classList.add('is-active');
            swipeTrack.setAttribute('aria-disabled', 'false');
            swipeTrack.setAttribute('aria-label', 'Recolección completada (deslizar para activar)');
            swipeTrack.setAttribute('tabindex', '0');
            
            swipeHandle.innerHTML = arrowIconSVG;
            swipeHandle.style.transform = 'translateX(0px)';
            swipeTextBaseLayer.textContent = 'Recolección completada';
            swipeTextOverlayLayer.textContent = 'Recolección completada';
            
            const trackContentWidth = swipeTrack.clientWidth - (trackPaddingLeft + trackPaddingRight);
            swipeTextOverlayLayer.style.width = `${trackContentWidth}px`;
            
            const handleHalfWidth = cachedHandleWidth / 2;
            swipeProgressFill.style.width = `${handleHalfWidth}px`; // Initialize fill under half the handle
            
            isSwipeCompleted = false;
            offsetX = 0;
        });
    }

    const startDrag = (clientX: number) => {
        if (!swipeTrack || swipeTrack.classList.contains('is-disabled') || isSwipeCompleted || !swipeHandle || !swipeProgressFill) return;
        isDragging = true;
        startX = clientX - offsetX; 
        
        swipeHandle.style.transition = 'none';
        swipeProgressFill.style.transition = 'none';
        if(swipeTrack) swipeTrack.style.cursor = 'grabbing';
        console.log('Swipe started');
    };

    const drag = (clientX: number) => {
        if (!isDragging || !swipeTrack || !swipeHandle || !swipeProgressFill) return;

        const currentOffsetX = clientX - startX;
        const maxTranslateX = swipeTrack.clientWidth - trackPaddingLeft - trackPaddingRight - cachedHandleWidth;

        offsetX = Math.max(0, currentOffsetX); 
        offsetX = Math.min(offsetX, maxTranslateX); 

        swipeHandle.style.transform = `translateX(${offsetX}px)`;

        const handleHalfWidth = cachedHandleWidth / 2;
        const fillWidth = offsetX + handleHalfWidth;
        swipeProgressFill.style.width = `${fillWidth}px`;
    };

    const endDrag = () => {
        if (!isDragging || !swipeTrack || !swipeHandle || !swipeTextBaseLayer || !swipeProgressFill || !swipeTextOverlayLayer) return;
        
        isDragging = false;
        // Re-apply transitions for snapping animation
        swipeHandle.style.transition = 'transform 0.2s ease, background-color 0.3s ease, fill 0.3s ease';
        swipeProgressFill.style.transition = 'width 0.2s ease';

        if(swipeTrack) swipeTrack.style.cursor = 'grab';

        const maxTranslateX = swipeTrack.clientWidth - trackPaddingLeft - trackPaddingRight - cachedHandleWidth;
        const threshold = maxTranslateX * 0.8; 

        if (offsetX >= threshold) {
            console.log('¡ACCIÓN CONFIRMADA!');
            offsetX = maxTranslateX; // Snap to the very end
            swipeHandle.style.transform = `translateX(${offsetX}px)`;
            swipeHandle.innerHTML = checkmarkIconSVG;
            
            swipeTrack.classList.remove('is-active');
            swipeTrack.classList.add('is-completed');
            swipeTrack.setAttribute('aria-disabled', 'true');
            swipeTrack.setAttribute('aria-label', 'Recolección verificada');
            
            swipeTextBaseLayer.textContent = 'Completado';
            
            swipeProgressFill.style.width = '0px'; // Hide progress fill in completed state
            isSwipeCompleted = true;

            // Placeholder for actual confirmation logic:
            // onConfirmed(); 
        } else {
            console.log('Deslizamiento cancelado.');
            offsetX = 0;
            swipeHandle.style.transform = 'translateX(0px)';
            swipeHandle.innerHTML = arrowIconSVG;

            const handleHalfWidth = cachedHandleWidth / 2;
            swipeProgressFill.style.width = `${handleHalfWidth}px`; // Reset fill to initial active state
        }
    };

    if (swipeTrack && swipeHandle) {
        if (swipeTrack.classList.contains('is-disabled')) {
            swipeTrack.setAttribute('aria-disabled', 'true');
            swipeTrack.setAttribute('tabindex', '-1');
             if (swipeHandle) swipeHandle.innerHTML = arrowIconSVG; // Ensure correct icon on load
        } else {
            swipeTrack.setAttribute('aria-disabled', 'false');
            swipeTrack.setAttribute('tabindex', '0');
        }

        swipeHandle.addEventListener('mousedown', (e) => {
            if (swipeTrack.classList.contains('is-active')) {
                startDrag(e.clientX);
            }
        });

        swipeHandle.addEventListener('touchstart', (e) => {
            if (swipeTrack.classList.contains('is-active') && e.touches[0]) {
                 startDrag(e.touches[0].clientX);
            }
        }, { passive: true });


        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                drag(e.clientX);
            }
        });
        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                drag(e.touches[0].clientX);
            }
        }, { passive: false }); 

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                endDrag();
            }
        });
        document.addEventListener('touchend', () => {
             if (isDragging) {
                endDrag();
            }
        });
    }
});