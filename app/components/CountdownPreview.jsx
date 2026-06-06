import React from 'react';

export function CountdownPreview({ template, customization = {} }) {
  const {
    fontColor = template.defaultColors.fontColor,
    textColor = template.defaultColors.textColor,
    buttonColor = template.defaultColors.buttonColor,
    backgroundColor = template.defaultColors.backgroundColor,
    title = "Flash Sale!",
    description = "Hurry up before the offer ends.",
    ctaText = "Shop Now"
  } = customization;

  // Render dummy time
  const days = "02";
  const hours = "14";
  const minutes = "35";
  const seconds = "42";

  // Template specific styles for the preview container
  let containerStyle = {
    background: backgroundColor,
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.3s ease'
  };

  let timerBlockStyle = {
    fontSize: '24px', 
    fontWeight: 'bold', 
    color: fontColor,
    padding: '8px',
    borderRadius: '8px'
  };

  // Add some specific styling hints based on template ID to make previews look distinct
  if (template.id === 'template-1') {
    containerStyle.border = '1px solid #e2e8f0';
    containerStyle.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
  } else if (template.id === 'template-2') {
    // Glassmorphism
    if (backgroundColor === 'rgba(255, 255, 255, 0.1)') {
      containerStyle.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9))';
    }
    containerStyle.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
    containerStyle.backdropFilter = 'blur(10px)';
    containerStyle.border = '1px solid rgba(255,255,255,0.2)';
  } else if (template.id === 'template-3') {
    // Neon
    timerBlockStyle.textShadow = `0 0 10px ${fontColor}, 0 0 20px ${fontColor}`;
  } else if (template.id === 'template-4') {
    // Luxury Dark
    timerBlockStyle.background = 'rgba(255,255,255,0.05)';
    timerBlockStyle.border = '1px solid rgba(255,255,255,0.1)';
  } else if (template.id === 'template-6' || template.id === 'template-7') {
    // Premium / VIP
    timerBlockStyle.background = 'rgba(0,0,0,0.4)';
    timerBlockStyle.border = `1px solid ${fontColor}`;
    containerStyle.boxShadow = `0 10px 40px rgba(0,0,0,0.5)`;
  }

  const renderTimerBlock = (value, label) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 8px' }}>
      <div style={timerBlockStyle}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: textColor, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <h3 style={{ color: fontColor, fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>{title}</h3>
      <p style={{ color: textColor, marginBottom: '20px', fontSize: '15px' }}>{description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', alignItems: 'center' }}>
        {renderTimerBlock(days, "DAYS")}
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: fontColor, paddingBottom: '16px' }}>:</div>
        {renderTimerBlock(hours, "HOURS")}
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: fontColor, paddingBottom: '16px' }}>:</div>
        {renderTimerBlock(minutes, "MINUTES")}
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: fontColor, paddingBottom: '16px' }}>:</div>
        {renderTimerBlock(seconds, "SECONDS")}
      </div>

      <button style={{
        backgroundColor: buttonColor,
        color: ['#ffffff', '#f8fafc', '#f3f4f6'].includes(buttonColor.toLowerCase()) ? '#000' : '#fff',
        padding: '12px 32px',
        border: 'none',
        borderRadius: template.id.includes('template-1') ? '4px' : '30px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: template.id === 'template-3' ? `0 0 15px ${buttonColor}` : 'none'
      }}>
        {ctaText}
      </button>
    </div>
  );
}
